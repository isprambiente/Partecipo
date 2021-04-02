# frozen_string_literal: true

# This model manage the facts (events)
# === Relations
# has many {Happening}
# === Validates
# * presence of {title}
# * presence of {start_on}
# * presence of {stop_on}
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
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
#
# @!method self.future()
#   @return [Array] list of [Fact] with stop_on egual or greather than Time.zone.today, ordered by pinnes asc, stop_on asc
# @!method self.history()
#   @return [Array] list of [Fact] with stop_on minor than Time.zone.today, ordered by start_on desc
class Fact < ApplicationRecord
  has_rich_text :body
  has_one_attached :image
  belongs_to :group
  has_many :happenings
  has_many :tickets, through: :happenings
  validates :title, presence: true
  validates :start_on, presence: true
  validates :stop_on, presence: true
  enum tickets_frequency: [:any, :single, :daily, :weekly, :monthly]

  after_create :add_default_image, unless: proc { |fact| fact.image.attached? }

  scope :future,  -> { where('stop_on >= :from', from: Time.zone.today).order('pinned desc, stop_on asc') }
  scope :history, -> { where('stop_on < :from', from: Time.zone.today).order('start_on desc') }

  private

  # add a default image
  def add_default_image
    image.attach(io: File.open(Rails.root.join('app', 'javascript', 'images', 'default.png')), filename: 'default.png', content_type: 'image/png')
  end
end
