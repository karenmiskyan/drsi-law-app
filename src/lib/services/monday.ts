interface MondayClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maritalStatus: string;
  amount: string;
  driveLink?: string;
}

export async function createMondayItem(data: MondayClient): Promise<string> {
  if (!process.env.MONDAY_API_TOKEN || !process.env.MONDAY_BOARD_ID) {
    console.warn("Monday.com credentials not configured");
    return "";
  }

  try {
    const mutation = `
      mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
    `;

    const variables = {
      boardId: process.env.MONDAY_BOARD_ID,
      itemName: `${data.firstName} ${data.lastName}`,
      columnValues: JSON.stringify({
        status: { label: "Paid" },
        email: data.email,
        phone: data.phone,
        marital_status: data.maritalStatus,
        amount: data.amount,
        contract_link: data.driveLink || "",
      }),
    };

    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.MONDAY_API_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Monday.com API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data?.create_item?.id || "";
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    throw new Error("Failed to create Monday.com item");
  }
}

