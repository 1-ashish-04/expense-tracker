from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import F
from django.db.models.functions import TruncMonth

from transactions.models import Transaction

class SummaryReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        transactions = Transaction.objects.filter(
            user=request.user
        )

        income = (
            transactions
            .filter(transaction_type="income")
            .aggregate(total=Sum("amount"))
        )

        expense = (
            transactions
            .filter(transaction_type="expense")
            .aggregate(total=Sum("amount"))
        )

        total_income = income["total"] or 0
        total_expense = expense["total"] or 0

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "net_balance": total_income - total_expense,
            "transaction_count": transactions.count()
        })


class CategoryBreakdownView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = (
            Transaction.objects
            .filter(
                user=request.user,
                transaction_type="expense"
            )
            .values(
                "category__name"
            )
            .annotate(
                total=Sum("amount")
            )
            .order_by("-total")
        )

        return Response(data)


class MonthlyReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = (
            Transaction.objects
            .filter(
                user=request.user
            )
            .annotate(
                month=TruncMonth(
                    "transaction_date"
                )
            )
            .values(
                "month",
                "transaction_type"
            )
            .annotate(
                total=Sum("amount")
            )
            .order_by("month")
        )

        return Response(data)