
import TicketClass from './schemas/ticket-classes.js';

export async function getAllTicketClasses() {
  return TicketClass.find({}).lean();
}

export async function getTicketClassesForDay(day) {
  const ticketClasses = await TicketClass.find({}).lean();

  return ticketClasses.map((ticketClass) => ({
    ...ticketClass,
    available: ticketClass.availableDays?.includes(day) ?? false
  }));
}
