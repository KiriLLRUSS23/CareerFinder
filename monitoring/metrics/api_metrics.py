# monitoring/metrics/api_metrics.py
import time
from django.http import JsonResponse

# Простой словарь для хранения метрик (в продакшене используйте Prometheus Client)
api_metrics = {
    "requests_count": 0,
    "total_response_time": 0.0,
    "error_count": 0,
}

def api_metrics_middleware(get_response):
    def middleware(request):
        global api_metrics
        start_time = time.time()

        response = get_response(request)

        # Обновляем метрики
        api_metrics["requests_count"] += 1
        response_time = time.time() - start_time
        api_metrics["total_response_time"] += response_time

        if 400 <= response.status_code < 600:
            api_metrics["error_count"] += 1

        return response

    return middleware

def get_api_metrics_view(request):
    """View для получения метрик API."""
    avg_response_time = api_metrics["total_response_time"] / api_metrics["requests_count"] if api_metrics["requests_count"] > 0 else 0
    return JsonResponse({
        "requests_count": api_metrics["requests_count"],
        "average_response_time": round(avg_response_time, 4),
        "error_count": api_metrics["error_count"]
    })