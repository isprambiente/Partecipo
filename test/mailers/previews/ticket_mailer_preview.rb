# Preview all emails at http://localhost:3000/rails/mailers/ticket_mailer
class TicketMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/ticket_mailer/confirm
  def confirm
    TicketMailer.confirm Ticket.last
  end

  # Preview this email at http://localhost:3000/rails/mailers/ticket_mailer/deleted
  def deleted
    TicketMailer.deleted Ticket.last
  end

  # Preview this email at http://localhost:3000/rails/mailers/ticket_mailer/reminder
  def reminder
    ticket = Ticket.last
    TicketMailer.reminder ticket.happening, ticket.user
  end
end
