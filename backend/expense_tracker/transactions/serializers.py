from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = [
            "id",
            "account",
            "category",
            "transaction_type",
            "amount",
            "description",
            "transaction_date",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate(self, attrs):

        request = self.context["request"]

        account = attrs.get(
            "account",
            self.instance.account if self.instance else None
        )

        category = attrs.get(
            "category",
            self.instance.category if self.instance else None
        )

        transaction_type = attrs.get(
            "transaction_type",
            self.instance.transaction_type if self.instance else None
        )

        amount = attrs.get(
            "amount",
            self.instance.amount if self.instance else None
        )

        if account.user != request.user:
            raise serializers.ValidationError(
                "Invalid account."
            )

        if category.user != request.user:
            raise serializers.ValidationError(
                "Invalid category."
            )

        if (
            transaction_type == "expense"
            and account.balance < amount
        ):
            raise serializers.ValidationError(
                "Insufficient balance."
            )

        return attrs