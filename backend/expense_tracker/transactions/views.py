from rest_framework import viewsets

from .models import Transaction
from .serializers import TransactionSerializer

from django.db import transaction as db_transaction

from .services import (
    apply_transaction,
    reverse_transaction,
)

class TransactionViewSet(viewsets.ModelViewSet):

    serializer_class = TransactionSerializer

    def get_queryset(self):

        return (
            Transaction.objects
            .filter(user=self.request.user)
            .select_related(
                "account",
                "category"
            )
        )

    @db_transaction.atomic
    def perform_create(self, serializer):

        transaction_obj = serializer.save(
            user=self.request.user
        )

        apply_transaction(
            transaction_obj.account,
            transaction_obj.transaction_type,
            transaction_obj.amount
        )

    @db_transaction.atomic
    def perform_destroy(self, instance):

        reverse_transaction(
            instance.account,
            instance.transaction_type,
            instance.amount
        )

        instance.delete()


    @db_transaction.atomic
    def perform_update(self, serializer):

        old_transaction = self.get_object()

        reverse_transaction(
            old_transaction.account,
            old_transaction.transaction_type,
            old_transaction.amount
        )

        updated_transaction = serializer.save()

        apply_transaction(
            updated_transaction.account,
            updated_transaction.transaction_type,
            updated_transaction.amount
        )