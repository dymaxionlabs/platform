import { loadStripe } from "@stripe/stripe-js";
import { buildApiUrl } from "../../utils/api";
import { withAuthSync } from "../../utils/auth";
import { routerReplace } from "../../utils/router";
import axios from "axios";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

class BuyPage extends React.Component {
  state = {
    pack: null,
    error: null,
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
      return;
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
        this.setState({ error: results.error.message });
      }
    } catch (err) {
      this.setState({ error: "An error occurred. Please retry later." });
      console.error(err);
    }
  }

  render() {
    const { error } = this.state;
    return <p style={{ margin: "1em" }}>{error || "Redirecting..."}</p>;
  }
}

BuyPage = withAuthSync(BuyPage);

export default BuyPage;
