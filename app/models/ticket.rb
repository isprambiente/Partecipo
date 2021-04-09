# frozen_string_literal: true

# This model manage the {Happening} {Ticket} for each {User}
# === Relations
# belongs to {Happening}
# belongs to {User}
# === Validates
# * presence of {Happening}
# * presence of {User}
# * presence of {seats}
# * numericality of {seats}
# * total seats are minor to {Happening.max_seats}
# === after save
# * update {Happening.seats_count} with {Happening.update_seats_count!}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {Ticket}
# @!attribute [rw] happening_id
#   @return [Integer] identifier of related {Happening}
# @!attribute [rw] user_id
#   @return [Integer] identifier of related {User}
# @!attribute [rw] seats
#   @return [Integer] number of seats for this {Ticket}
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was created
class Ticket < ApplicationRecord
  belongs_to :happening, counter_cache: true
  belongs_to :user
  delegate :fact, :fact_id, :max_seats, :max_seats_for_ticket, :saleable?, :seats_count, :start_at, :update_seats_count!, to: :happening, allow_nil: true

  attr_accessor :by_editor

  validates :happening, presence: true
  validates :user, presence: true, uniqueness: { scope: :happening_id }
  validates :seats, presence: true
  validates :seats, numericality: { less_than_or_equal_to: :max_seats_for_ticket }, unless: :by_editor?
  validate  :validate_saleability, unless: :by_editor?
  validate  :validate_total_seats, unless: :by_editor?
  validate  :validate_frequency, unless: :by_editor?

  after_save :update_seats_count!

  # @return [Boolean] true if by_editor is true
  def by_editor?
    by_editor == true
  end

  private

  # Add an error unless {Happening.saleable?} is true
  def validate_saleability
    errors.add(:seats, 'Posti non assegnabili') unless saleable?
  end

  # Add error unless requested seats are minor than available seatc
  def validate_total_seats
    errors.add(:seats, 'Posti non disponibili') if seats_count + seats.to_i > max_seats
  end

  # check {User}'s ticket presence based of {Fact#tickets_frequency}
  def validate_frequency
    exist, message = case fact.tickets_frequency
                     when 'single'
                       [fact_ticket_exist?, I18n.t('site.ticket.errors.single')]
                     when 'daily'
                       [fact_ticket_exist?(start_at.beginning_of_day..start_at.end_of_day), I18n.t('site.ticket.errors.daily')]
                     when 'weekly'
                       [fact_ticket_exist?(start_at.-(7.days)..start_at.+(7.days)), I18n.t('site.ticket.errors.weekly')]
                     when 'monthly'
                       [fact_ticket_exist?(start_at.-(30.days)..start_at.+(30.days)), I18n.t('site.ticket.errors.montly')]
                       elseapp / controllers / tickets_controller.rb
                       return true
                     end
    errors.add(:seats, message) if exist
  end

  # check if exists {Fact}'s {Ticket} for {User} in a time period
  def fact_ticket_exist?(period = nil)
    @when = { happenings: { start_at: period } } if period.present?
    fact.tickets.where(@when).where(user: user).exists?
  end
end
