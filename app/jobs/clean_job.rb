# This job remove {Happening}s and {Ticket}s expired from an arbitrary days number.
# Remove old data is required to grant the user privacy
class CleanJob < ApplicationJob
  queue_as :default

  # On perform, expired {Happening}s from an arbitrary days number are destroyed.
  # On destroy each [Happening] destroy relative [Ticket]s
  # 
  # @param days [Integer,Nil] destroy {Happening} exired from :days
  # @return [ARRAY] of destroyed happenings
  # @return [NIL] if :days isn't defined, return nil and anyting is destroyed
  # @example destroy {Happening} expired from 60 days
  #   CleanJob.perform_now(days: 60)
  # @example destroy anyting
  #   CleanJob.perform_now
  #   CleanJob.perform_now(days: nil)
  def perform(days: nil)
    Happening.where(start_at: [..Time.zone.now.to_date - days.to_i]).destroy_all if days.present?
  end
end
