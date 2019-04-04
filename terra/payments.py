import json
import os

import mercadopago


class MercadoPagoClient:
    def __init__(self, secrets_file):
        with open(secrets_file) as f:
            self.secrets = json.load(f)

    @property
    def available_countries(self):
        return sorted([key for key in self.secrets.keys() if key != 'default'])

    def create_preference(self,
                          quantity=1,
                          currency_id="USD",
                          cc=None,
                          *,
                          title,
                          unit_price):
        mp = self._client_for(cc)
        preference = {
            "items": [{
                "title": title,
                "quantity": quantity,
                "currency_id": currency_id,
                "unit_price": unit_price
            }]
        }
        result = mp.create_preference(preference)
        return result['response']

    def _client_for(self, country_code):
        cc_data = self.secrets.get(country_code, self.secrets.get('default'))
        return mercadopago.MP(cc_data['id'], cc_data['secret'])


secrets_file = os.getenv('MERCADOPAGO_SECRETS', '.mercadopago.json')
if os.path.exists(secrets_file):
    MP_CLIENT = MercadoPagoClient(secrets_file)
else:
    print("Warning! {} was not found".format(secrets_file))
    MP_CLIENT = None
