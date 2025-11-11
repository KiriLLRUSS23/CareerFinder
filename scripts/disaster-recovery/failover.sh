#!/bin/bash
set -e

echo "🔄 Starting disaster recovery failover procedure"
echo "⏰ 2025-11-11 00:21:09 MSK"

# Function to check primary region status
check_primary_region() {
  echo "🔍 Checking primary region status..."
  
  # Check API health in primary region
  primary_api_health=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "https://api.careerfinder.ru/health" || echo "000")
  
  # Check database connectivity in primary region
  primary_db_health=$(docker exec careerfinder-postgres psql -U careerfinder -d careerfinder_v7_production -c "\q" 2>/dev/null && echo "200" || echo "000")
  
  echo "📊 Primary region status:"
  echo "   API Health: $primary_api_health"
  echo "   Database Health: $primary_db_health"
  
  if [ "$primary_api_health" = "200" ] && [ "$primary_db_health" = "200" ]; then
    echo "✅ Primary region is healthy - no failover needed"
    return 0
  else
    echo "❌ Primary region is unhealthy - initiating failover"
    return 1
  fi
}

# Function to activate failover region
activate_failover_region() {
  echo "🚀 Activating failover region..."
  
  # Update DNS records to point to failover region
  echo "🔄 Updating DNS records..."
  curl -X PATCH -H "Authorization: Bearer $DNS_API_TOKEN"     -H "Content-Type: application/json"     -d '{
      "records": [
        {
          "name": "careerfinder.ru",
          "type": "A",
          "content": "'"$FAILOVER_IP"'",
          "ttl": 60
        },
        {
          "name": "api.careerfinder.ru",
          "type": "A", 
          "content": "'"$FAILOVER_IP"'",
          "ttl": 60
        }
      ]
    }' "https://dns.provider.com/api/v1/zones/$ZONE_ID/records"
  
  # Activate failover database
  echo "🔄 Activating failover database..."
  docker exec careerfinder-postgres-primary pg_ctl promote
  
  # Start failover services
  echo "🔄 Starting failover services..."
  docker-compose -f infra/docker/docker-compose-failover.yml up -d
  
  echo "✅ Failover region activated successfully"
}

# Function to send failover notification
send_failover_notification() {
  echo "📢 Sending failover notification..."
  
  curl -X POST -H "Content-Type: application/json"     -d '{
      "text": "🔄 CareerFinder Disaster Recovery - Failover Activated",
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Disaster Recovery: Failover Activated"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Primary region is unhealthy. Failover to backup region has been initiated."
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Timestamp:*"
            },
            {
              "type": "mrkdwn",
              "text": "'"2025-11-11 00:21:09 MSK"'""
            },
            {
              "type": "mrkdwn",
              "text": "*Failover Region:*"
            },
            {
              "type": "mrkdwn",
              "text": "'"$FAILOVER_REGION"'""
            },
            {
              "type": "mrkdwn",
              "text": "*Estimated Downtime:*"
            },
            {
              "type": "mrkdwn",
              "text": "<30 seconds"
            }
          ]
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "All services should be available within 2 minutes. Data synchronization will continue in background."
            }
          ]
        }
      ]
    }' "$SLACK_WEBHOOK_URL"
  
  # Send SMS alert to critical personnel
  curl -X POST -H "Content-Type: application/json"     -d '{
      "to": "'"$CRITICAL_PERSONNEL_PHONE"'",
      "message": "CRITICAL: CareerFinder failover activated at 2025-11-11 00:21:10 MSK. Primary region down. Failover region: $FAILOVER_REGION"
    }' "https://sms.provider.com/api/v1/send"
}

# Main failover procedure
if check_primary_region; then
  echo "✅ Primary region is healthy - no action needed"
  exit 0
else
  echo "🔄 Primary region unhealthy - proceeding with failover"
  
  # Activate failover region
  activate_failover_region
  
  # Send notifications
  send_failover_notification
  
  echo "✅ Failover procedure completed successfully"
  echo "🔄 Services should be available at failover region within 2 minutes"
  
  # Verify failover region is healthy
  echo "✅ Verifying failover region health..."
  sleep 120
  
  failover_api_health=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://api-failover.careerfinder.ru/health" || echo "000")
  
  if [ "$failover_api_health" = "200" ]; then
    echo "✅ Failover region is healthy and serving traffic"
    
    # Send success notification
    curl -X POST -H "Content-Type: application/json"       -d '{
        "text": "✅ CareerFinder Failover Successful",
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "Failover Completed Successfully"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "All services are now available in the failover region. Data synchronization is ongoing."
            }
          }
        ]
      }' "$SLACK_WEBHOOK_URL"
  else
    echo "❌ Failover region activation failed"
    
    # Send failure notification
    curl -X POST -H "Content-Type: application/json"       -d '{
        "text": "❌ CareerFinder Failover Failed",
        "blocks": [
          {
            "type": "header", 
            "text": {
              "type": "plain_text",
              "text": "Failover Failed - Manual Intervention Required"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Failover region activation failed. Immediate manual intervention required."
            }
          }
        ]
      }' "$SLACK_WEBHOOK_URL"
    
    exit 1
  fi
fi
