# This job send a reminder for the next day happening
class ReminderJob < ApplicationJob
  queue_as :default
  
  # Send the reminder
  # @return [Boolean] `true` if executed, `false` if ENV `RAILS_REMINDER` is not set as "true"
  def perform
    return false unless ENV.fetch('RAILS_REMINDER', 'false') == 'true'
    happenings = Happening.where start_at: (Time.zone.tomorrow.beginning_of_day..Time.zone.tomorrow.end_of_day)
    happenings.each do |happening|
      happening.users do |user|
        TicketMailer.reminder(happening.user).deliver_later
      end
    end
    true
  end
end
