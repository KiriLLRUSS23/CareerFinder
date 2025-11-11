#!/bin/bash
set -e

echo "🔍 Starting production monitoring for CareerFinder v7.0"
echo "⏰ 2025-11-11 00:21:09 MSK"

# Function to check service health
check_service_health() {
  local service_name=$1
  local url=$2
  local expected_status=$3
  
  echo "🔍 Checking $service_name health..."
  
  response_code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$url")
  
  if [ "$response_code" = "$expected_status" ]; then
    echo "✅ $service_name is healthy (HTTP $response_code)"
    return 0
  else
    echo "❌ $service_name is unhealthy (HTTP $response_code, expected $expected_status)"
    return 1
  fi
}

# Function to check database connectivity
check_database_health() {
  echo "🔍 Checking database health..."
  
  if docker exec careerfinder-postgres psql -U careerfinder -d careerfinder_v7_production -c "\q" 2>/dev/null; then
    echo "✅ Database is healthy"
    return 0
  else
    echo "❌ Database is unhealthy"
    return 1
  fi
}

# Function to check carbon monitoring
check_carbon_monitoring() {
  echo "🔍 Checking carbon monitoring..."
  
  carbon_response=$(curl -s -H "Authorization: Bearer $API_TOKEN" http://localhost:3000/api/carbon/dashboard)
  carbon_status=$(echo "$carbon_response" | jq -r '.status' 2>/dev/null || echo "error")
  
  if [ "$carbon_status" = "active" ]; then
    echo "✅ Carbon monitoring is active"
    return 0
  else
    echo "❌ Carbon monitoring is inactive (status: $carbon_status)"
    return 1
  fi
}

# Function to check compliance monitoring
check_compliance_monitoring() {
  echo "🔍 Checking compliance monitoring..."
  
  compliance_response=$(curl -s -H "Authorization: Bearer $API_TOKEN" http://localhost:3000/api/compliance/status)
  compliance_status=$(echo "$compliance_response" | jq -r '.status' 2>/dev/null || echo "error")
  
  if [ "$compliance_status" = "active" ]; then
    echo "✅ Compliance monitoring is active"
    return 0
  else
    echo "❌ Compliance monitoring is inactive (status: $compliance_status)"
    return 1
  fi
}

# Main monitoring loop
while true; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⏰ 2025-11-11 00:21:09 MSK - Running monitoring checks"
  
  # Check all critical services
  health_checks=(
    "frontend|http://localhost/health|200"
    "api|http://localhost:3000/health|200"
    "carbon|http://localhost:3000/api/carbon/dashboard|200"
    "compliance|http://localhost:3000/api/compliance/status|200"
  )
  
  all_healthy=true
  
  for check in "${health_checks[@]}"; do
    IFS='|' read -r service_name url expected_status <<< "$check"
    if ! check_service_health "$service_name" "$url" "$expected_status"; then
      all_healthy=false
    fi
  done
  
  # Check database
  if ! check_database_health; then
    all_healthy=false
  fi
  
  # Check carbon monitoring
  if ! check_carbon_monitoring; then
    all_healthy=false
  fi
  
  # Check compliance monitoring
  if ! check_compliance_monitoring; then
    all_healthy=false
  fi
  
  # Send alerts if needed
  if [ "$all_healthy" = false ]; then
    echo "🚨 CRITICAL: One or more services are unhealthy!"
    
    # Send alert to Slack
    curl -X POST -H "Content-Type: application/json"       -d '{
        "text": "🚨 CareerFinder Production Alert - Services Unhealthy",
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "Production Alert: Services Unhealthy"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "One or more critical services are unhealthy. Immediate attention required."
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
                "text": "*Environment:*"
              },
              {
                "type": "mrkdwn",
                "text": "production"
              }
            ]
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "View Dashboard"
                },
                "url": "https://monitoring.careerfinder.ru"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Incident Response"
                },
                "url": "https://incident.careerfinder.ru"
              }
            ]
          }
        ]
      }' "$SLACK_WEBHOOK_URL"
    
    # Send alert to PagerDuty
    curl -X POST -H "Content-Type: application/json"       -H "Authorization: Token token=$PAGERDUTY_TOKEN"       -d '{
        "incident": {
          "type": "incident",
          "title": "CareerFinder Production Services Unhealthy",
          "service": {
            "id": "$PAGERDUTY_SERVICE_ID",
            "type": "service_reference"
          },
          "body": {
            "type": "incident_body",
            "details": "One or more critical services are unhealthy at 2025-11-11 00:21:09 MSK"
          }
        }
      }' "https://api.pagerduty.com/incidents"
  else
    echo "✅ All services are healthy"
  fi
  
  # Sleep for 60 seconds before next check
  sleep 60
done
