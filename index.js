const app = require('express')();
const stripe = require('stripe')(
  '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'
);

const cors = require('cors');
const bodyParser = require('body-parser');
var port = process.env.PORT || 9000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/', async (req, res) => {
  res.send('welcome');
});
app.post('/api/stripe/createAccount', async (req, res) => {
  const account = await stripe.accounts.create({
    type: 'standard',
    email: req.body.email,
  });
  // console.log(account.id);
  res.send(account.id);
});

app.post('/api/stripe/deleteAccount', async (req, res) => {
  console.log(req.body.account_id);
  const deleted = await stripe.accounts
    .del(req.body.account_id)
    .catch((err) => {
      console.log(err);
    });
  console.log(deleted);
  res.send('success');
});

app.post('/api/stripe/retrieveAccount', async (req, res) => {
  // console.log(req.body.account_id);
  if (req.body.account_id) {
    const account = await stripe.accounts.retrieve(req.body.account_id);
    console.log(account);
    account.success = true;
    res.json(account);
  } else {
    res.json({ msg: 'account_id is undefined', success: false });
  }
});

app.post('/api/stripe/accountLinks', async (req, res) => {
  // console.log(req.body.account_id);
  const accountLinks = await stripe.accountLinks
    .create({
      account: req.body.account_id,
      refresh_url: 'https://',
      return_url: 'https://',
      type: 'account_onboarding',
    })
    .catch((err) => {
      // console.log(err);
      res.json(err);
    });
  // console.log(accountLinks);
  res.json(accountLinks);
});

app.post('/api/stripe/intentMobileApp', async (req, res) => {
  let clonedPaymentMethod = await stripe.paymentMethods
    .create(
      {
        payment_method: req.body.payment_method,
      },
      {
        stripeAccount: req.body.account_id,
      }
    )
    .catch((err) => {
      console.log(err);
    });
  // console.log(clonedPaymentMethod);
  let percentage_split = req.body.percentage_split;
  if (percentage_split) {
    percentage_split = percentage_split / 100;
  } else {
    // defalut percentage_split is 20%
    percentage_split = 0.2;
  }
  const paymentIntent = await stripe.paymentIntents
    .create(
      {
        payment_method_types: ['card'],
        amount: req.body.amount,
        // payment_method: req.body.payment_method,
        payment_method: clonedPaymentMethod.id,
        currency: 'brl',
        description: req.body.description,
        receipt_email: req.body.user_email,
        application_fee_amount: Math.floor(req.body.amount * percentage_split),
        confirm: true,
      },
      {
        stripeAccount: req.body.account_id,
      }
    )
    .catch((err) => {
      console.log(err);
      res.json({
        err: err,
        success: false,
      });
    });

  // console.log(paymentIntent);
  if (paymentIntent.status == 'succeeded') {
    res.json({
      paymentIntent: paymentIntent.id,
      success: true,
    });
  } else {
    res.json({
      paymentIntent: paymentIntent.id,
      status: paymentIntent.status,
      success: false,
    });
  }
});

app.post('/api/stripe_intent', async (req, res) => {
  // console.log(typeof req.body.amount);
  const intent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'brl',
    payment_method_types: ['card'],
    payment_method: req.body.payment_method,
  });
  // console.log(intent.client_secret);
  res.send(intent.client_secret);
});

app.post('/api/sub', async (req, res) => {
  const { email, payment_method, price } = req.body;

  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,

    items: [{ price }],
    expand: ['latest_invoice.payment_intent'],
  });

  const status = subscription['latest_invoice']['payment_intent']['status'];
  const client_secret =
    subscription['latest_invoice']['payment_intent']['client_secret'];

  res.json({
    client_secret: client_secret,
    status: status,
    subscriptionID: subscription.id,
  });
});
app.post('/api/sub/delete', async (req, res) => {
  const { subscriptionID } = req.body;
  console.log(req.body);
  if (!subscriptionID) {
    return res.status(500).json({ message: 'Subscription Was Not Passed!' });
  }
  try {
    const deleted = await stripe.subscriptions.del(subscriptionID);
    return res.status(200).json({ message: 'Subscription cancelled' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Internal Server Error!' });
  }
});

app.listen(port, () => console.log('Listening ' + port));
