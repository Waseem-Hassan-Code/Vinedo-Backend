import {
  creatorSubscriptionModel,
  getCreatorSubscriptionDetails,
} from "../Model/creatorSubDetails";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

const adminEmail = "sb-7e7rt28761435@business.example.com";

const base = "https://api-m.sandbox.paypal.com";

async function calculateSplitPayments(
  totalAmount: number,
  creatorId: string
): Promise<{ sellerAmount: number; adminAmount: number }> {
  if (typeof totalAmount !== "number" || isNaN(totalAmount)) {
    throw new Error("Invalid total amount. Expected a number.");
  }
  try {
    const price = await getCreatorPrice(creatorId);

    if (price !== null) {
      const sellerAmount = (price * 80) / 100;
      const adminAmount = (price * 20) / 100;
      return { sellerAmount, adminAmount };
    } else {
      throw new Error("Creator price not found for the specified ID.");
    }
  } catch (error) {
    throw new Error(`Error calculating split payments: ${error.message}`);
  }
}

async function getCreatorPrice(creatorId: string): Promise<number | null> {
  try {
    const creatorEmail = await creatorSubscriptionModel.findOne({ creatorId });

    if (creatorEmail) {
      return creatorEmail.subscriptionPrice;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Error retrieving creator email");
  }
}

async function getCreatorSubscriptioDetails(creatorId: string) {
  try {
    const creatorDetails = await getCreatorSubscriptionDetails(creatorId);

    if (creatorDetails) {
      return creatorDetails;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Error retrieving creator email");
  }
}

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

async function executePayPalPayouts(senderBatchId: string, items: any[]) {
  try {
    const accessToken = await generateAccessToken();

    const response = await fetch(`${base}/v1/payments/payouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: senderBatchId,
          email_subject: "Payment from your vinedo.",
        },
        items: items,
      }),
    });

    const data = await response.json();
    console.log("PayPal Payouts Response:", data);
  } catch (error) {
    console.error("Failed to execute PayPal Payouts:", error);
  }
}

// Function to initiate the payment process
export async function initiatePayment(creatorId: string) {
  try {
    // Retrieve seller and admin emails from the database
    const sellerDetails = await getCreatorSubscriptioDetails(creatorId);

    const sellerEmail = sellerDetails.payPalEmail;
    const totalAmount = sellerDetails.subscriptionPrice;

    if (!sellerDetails) {
      throw new Error("Seller email not found.");
    }

    // Calculate split amounts
    const { sellerAmount, adminAmount } = await calculateSplitPayments(
      totalAmount,
      creatorId
    );

    // Prepare items for PayPal Payouts
    const items = [
      {
        recipient_type: "EMAIL",
        amount: {
          value: sellerAmount.toFixed(2),
          currency: "USD",
        },
        receiver: sellerEmail,
        note: "Payment from your platform",
      },
      {
        recipient_type: "EMAIL",
        amount: {
          value: adminAmount.toFixed(2),
          currency: "USD",
        },
        receiver: adminEmail,
        note: "Payment from your platform",
      },
    ];

    // Execute PayPal Payouts
    await executePayPalPayouts(`${Date.now()}-payouts`, items);
  } catch (error) {
    console.error("Error initiating payment:", error.message);
  }
}

//initiatePayment(creatorId);

//================================================================================================
