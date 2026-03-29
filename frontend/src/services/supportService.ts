import { getDb } from "@/mocks/data/database";
import { delay } from "@/services/mock/delay";
import type { SupportTicket } from "@/shared/types/domain";

export const supportService = {
  async listTickets() {
    await delay(220);
    return getDb().supportTickets.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async updateTicketStatus(ticketId: string, status: SupportTicket["status"]) {
    await delay(200);
    const ticket = getDb().supportTickets.find((item) => item.id === ticketId);
    if (!ticket) {
      throw new Error("Không tìm thấy ticket.");
    }
    ticket.status = status;
    return structuredClone(ticket);
  },
};
