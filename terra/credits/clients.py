import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_API_KEY


class StripeClient:
    def __init__(self, username):
        self.username = username

    def create_pack_checkout_session(self, pack_id, *, success_url,
                                     cancel_url):
        pack = settings.CREDITS_PACKS[pack_id]
        return self._create_checkout_session(client_reference_id=self.username,
                                             product_name=pack['name'],
                                             unit_amount=pack['unit_amount'],
                                             success_url=success_url,
                                             cancel_url=cancel_url)

    def _create_checkout_session(self,
                                 client_reference_id=None,
                                 *,
                                 product_name,
                                 unit_amount,
                                 success_url,
                                 cancel_url):
        return stripe.checkout.Session.create(
            payment_method_types=['card'],
            client_reference_id=client_reference_id,
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': product_name,
                    },
                    'unit_amount': unit_amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
        )
