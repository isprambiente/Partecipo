class TicketMailer < ApplicationMailer
  default from: Settings.email
  before_action :set_variables

  def confirm
    mail(to: @ticket.user.email, subject: 'conferma prenotazione') if @ticket.user.email.present?
  end

  def deleted
    mail(to: @ticket.user.email, subject: 'Conferma eliminazione prenotazione') if @ticket.user.email.present?
  end

  private

  def set_variables
    @ticket  = params[:ticket]
  end
end
