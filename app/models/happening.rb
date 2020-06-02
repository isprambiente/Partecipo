# frozen_string_literal: true

# This model manage the happenings for each {Fact}
# === Relations
# belongs to {Fact}
# has many {Ticket}
# === Validates
# * presence of {Fact}
# * presence of {start_at}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {Happening}
# @!attribute [rw] fact_id
#   @return [Integer] identifier of related {Fact}
# @!attribute [rw] title
#   @return [String] Is an optional description for {Happening}
# @!attribute [rw] start_at
#   @return [DateTime] when the {Happening} start
# @!attribute [rw] stop_sale_at
#   @return [DateTime] since {Ticket} can no longer be sold
# @!attribute [rw] max_seats_for_ticket
#   @return [Integer] Max seats for each ticket, default is 1
# @!attribute [rw] max_seats
#   @return [integer] number of seats for the {Happening}. If is null hasn't limit
# @!attribute [rw] ticketss_count
#   @return [Integer] counter cache for {Ticket}
# @!attribute [rw] seats_count
#   @return [Integer] counter cache of sum of {Ticket.seat}
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
#
# @!method self.future()
#   @return [Array] list of [Fact] with stop_on egual or greather than Time.zone.today, ordered by pinnes asc, stop_on asc
# @!method self.history()
#   @return [Array] list of [Fact] with stop_on minor than Time.zone.today, ordered by start_on desc
class Happening < ApplicationRecord
  belongs_to :fact, counter_cache: true
  has_many   :tickets
  validates  :fact, presence: true
  validates  :start_at, presence: true
  validates  :start_sale_at, presence: true
  validates  :stop_sale_at, presence: true
  validates  :max_seats, presence: true
  validates  :max_seats_for_ticket, presence: true

  scope :future,  -> { where('start_at >= :from', from: Time.zone.now).order('start_at asc') }
  scope :history, -> { where('start_at < :from', from: Time.zone.now).order('start_at desc') }

  # update {seats_count} with sum of her {Ticket.seats}
  def update_seats_count!
    self.seats_count = tickets.sum :seats
    save touch: false
  end

  def saleable?
    Time.zone.now >= start_sale_at && Time.zone.now <= stop_sale_at
  end

  def code
    [fact_id, id].join(' - ')
  end
end
