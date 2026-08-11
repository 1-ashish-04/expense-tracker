from django.urls import path

from . import views

urlpatterns = [
    path(
        "summary/",
        views.SummaryReportView.as_view()
    ),

    path(
        "categories/",
        views.CategoryBreakdownView.as_view()
    ),

    path(
        "monthly/",
        views.MonthlyReportView.as_view()
    ),
]