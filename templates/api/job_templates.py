# templates/api/job_templates.py
from datetime import datetime

def format_job_response(job):
    """
    Форматирует объект вакансии в JSON-ответ API.
    """
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "employer": {
            "id": job.employer.id,
            "name": job.employer.first_name + " " + job.employer.last_name
        },
        "location": {
            "region": job.location_region,
            "city": job.location_city
        },
        "salary": {
            "min": float(job.salary_min) if job.salary_min else None,
            "max": float(job.salary_max) if job.salary_max else None
        },
        "employment_type": job.employment_type,
        "experience_level": job.experience_level,
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat()
    }

def format_job_list_response(jobs):
    """
    Форматирует список вакансий.
    """
    return {
        "count": len(jobs),
        "results": [format_job_response(job) for job in jobs]
    }