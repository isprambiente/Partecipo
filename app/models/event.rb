# frozen_string_literal: true

# This model manage the events
# === Relations
# has many {Happening}
# === Validates
# * presence of {title}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {Fact}
# @!attribute [rw] title
#   @return [String] title of {Fact}
# @!attribute [rw] where
#   @return [string] where the {Fact} is located
# @!attribute [rw] pinned
#   @return [Boolean] [true] if this {Fact} has priority
# @!attribute [rw] start_on
#   @return [date] when start {Fact}
# @!attribute [rw] stop_on
#   @return [date] when end {Fact}
# @!attribute [rw] happenings_count
#   @return [Integer] counter cache for {Happening}
# @!attribute [rw] tickets_frequency
#   @return [String] enum of tickets frequency statuses
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
#
# @!method self.future()
#   @return [Array] list of [Fact] with stop_on egual or greather than Time.zone.today, ordered by pinnes, stop_on
# @!method self.history()
#   @return [Array] list of [Fact] with stop_on minor than Time.zone.today, ordered by start_on desc
class Event < ApplicationRecord
  has_rich_text :body
  has_one_attached :image do |attachable|
    attachable.variant :card, resize_to_limit: [ 417, 278 ]
    attachable.variant :aside, resize_to_limit: [ 318, 318 ]
    attachable.variant :ticket, resize_to_limit: [ 150, 68 ]
  end
  belongs_to :group
  has_many :happenings, dependent: :destroy
  has_many :tickets, through: :happenings
  validates :title, presence: true
  enum tickets_frequency: { any: 0, single: 1, daily: 2, weekly: 3, monthly: 4 }

  scope :future,  -> { where("stop_on >= :from", from: Time.zone.today).order("pinned desc, stop_on asc") }
  scope :history, -> { where("stop_on < :from", from: Time.zone.today).order("start_on desc") }
  scope :with_date, -> { where.not(stop_on: nil) }

  # @return {String} image path with variand or default image
  def image_url(_variant = :card)
    image.present? ? image.variant(:card) : "default.png"
  end
end
