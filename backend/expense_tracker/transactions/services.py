from decimal import Decimal


def apply_transaction(account, transaction_type, amount):

    if transaction_type == "income":
        account.balance += amount
    else:
        account.balance -= amount

    account.save()


def reverse_transaction(account, transaction_type, amount):

    if transaction_type == "income":
        account.balance -= amount
    else:
        account.balance += amount

    account.save()