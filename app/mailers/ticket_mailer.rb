# This class send collect the tickets notification
class TicketMailer < ApplicationMailer
  # Send confirmation email for a ticket
  # @param ticket [Object] istance of created {Ticket}
  def confirm(ticket)
    @ticket = ticket
    @happening = @ticket.happening
    mail to: @ticket.user.email, subject: subject(action: 'confirm', date: @happening.start_at)
  end

  # Send notify email on destroy ticket
  # @param ticket [Object] istance of destroyed {Ticket}
  def deleted(ticket)
    @ticket = ticket
    @happening = @ticket.happening
    @tickets = Ticket.where(user: ticket.user, happening: ticket.happening)
    mail to: @ticket.user.email, subject: subject(action: 'deleted', date: @happening.start_at)
  end

  # Send reminder for an event happeningf
  # @param happening [Object] Istance of {Happening} to remind
  # @param user [Object] Istance of {User} send remind. If user have not ticket the remind is not sended
  def reminder(happening, user)
    @happening = happening
    @user = user
    @counter = @happening.tickets.with_user(@user).count
    mail to: @user.email, subject: subject(action: 'reminder', date: @happening.start_at) if @counter > 0
  end

  private

  # make email subject with site title, action text, date of referenced happening
  # @param action [String] optional action name to add a locale path on subject: `reminder` -> `mailer.ticket.reminder.action`.
  # @param date [Date,DateTime] If present append the localized date / datetime on subject
  # @return [String] subject text
  # @example 
  #   subject
  #   -> Partecipo
  #   subject action: 'prova'
  #   -> Partecipo - prova - 25/12/24 00:00
  #   subject action: 'prova', date: @happening.start_at
  #   -> Partecipo - prova
  def subject(action: nil, date: nil, other: nil)
    title_text  = ENV.fetch "RAILS_TITLE", "Partecipo"
    action_text = t("mailer.ticket.#{action}.action", locale: I18n.locale) if action.present?
    data_text   = l date, format: :detailed if date.present?
    other_text  = other if other.present?
    [title_text, action_text, data_text, other_text].compact.join(' - ')
  end
end
