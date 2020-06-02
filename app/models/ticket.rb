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
  delegate :max_seats, :max_seats_for_ticket, :saleable?, :seats_count, :start_at, :update_seats_count!, to: :happening, allow_nil: true

  validates :happening, presence: true
  validates :user, presence: true, uniqueness: { scope: :happening_id }
  validates :seats, presence: true
  validates :seats, numericality: { less_than_or_equal_to: :max_seats_for_ticket }, unless: :by_editor?
  validate  :validate_saleability, unless: :by_editor?
  validate  :validate_total_seats, unless: :by_editor?
  validate  :validate_same_day, unless: :by_editor?

  attr_accessor :by_editor

  after_save :update_seats_count!

  def by_editor?
    by_editor == true
  end

  private

  def validate_saleability
    errors.add(:seats, 'Posti non assegnabili') unless saleable?
  end

  # Add error if
  def validate_total_seats
    errors.add(:seats, 'Posti non disponibili') if seats_count + seats.to_i > max_seats
  end

  # add error if exist another {Ticket} in same day for same {Fact} f
  def validate_same_day
    h = Happening.where(fact: happening.fact, start_at: (start_at.beginning_of_day..start_at.end_of_day))
    tickets = Ticket.where(user: user, happening: h).where.not(id: id).count
    errors.add(:seats, 'Non e` possibile prenotare piu` volte un evento nello stesso giorno') if tickets > 0
  end
end
