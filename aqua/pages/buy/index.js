import { loadStripe } from "@stripe/stripe-js";
import { buildApiUrl } from "../../utils/api";
import { withAuthSync } from "../../utils/auth";
import { routerReplace } from "../../utils/router";
import axios from "axios";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51GvnHlJbe4J7GDndRs5UK3Mu5xOYGsBwwp6wi98JL6Y4C39OizshWMhU9J63K161FUlAgQyEKYkxMksgIjv7cuS700IOCcGkHp"
);

class BuyPage extends React.Component {
  state = {
    pack: null,
  };

  static async getInitialProps({ query }) {
    return { query };
  }

  async componentDidMount() {
    await this.createCheckoutSession();
  }

  async createCheckoutSession() {
    const { pack } = this.props.query;
    if (!pack) {
      routerReplace("//dymaxionlabs.com/pricing");
    }

    const successUrl = `${location.protocol}//${location.host}/buy/thanks`;
    const cancelUrl = "https://dymaxionlabs.com/pricing";

    try {
      const response = await axios.post(
        buildApiUrl(`/credits/buy-pack/${pack}`),
        {},
        {
          params: { success_url: successUrl, cancel_url: cancelUrl },
          headers: { Authorization: this.props.token },
        }
      );
      console.log(response);

      // Get Stripe.js instance
      const stripe = await stripePromise;

      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.session_id,
      });

      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
        alert(results.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return <span>Redirecting...</span>;
  }
}

BuyPage = withAuthSync(BuyPage);

export default BuyPage;
