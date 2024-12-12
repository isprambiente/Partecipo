
# frozen_string_literal: true

# This model manage the happenings for each {Event}
# === Relations
# belongs to {Event}
# has many {Ticket}
# === Validates
# * presence of {Event}
# * presence of {start_at}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {Happening}
# @!attribute [rw] event_id
#   @return [Integer] identifier of related {Event}
# @!attribute [rw] title
#   @return [String] Is an optional description for {Happening}
# @!attribute [rw] start_at
# @return [DateTime] when the {Happening} start
# @!attribute [rw] stop_sale_at
#   @return [DateTime] since {Ticket} can no longer be sold
# @!attribute [rw] max_seats_for_ticket
#   @return [Integer] Max seats for each ticket, default is 1
# @!attribute [rw] max_seats
#   @return [integer] number of seats for the {Happening}. If is null hasn't limit
# @!attribute [rw] ticketss_count
#   @return [Integer] counter cache for {Ticket}
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
#
# @!method self.future()
#   @return [Array] list of [Event] with stop_on egual or greather than Time.zone.today, ordered by pinnes, stop_on
# @!method self.history()
#   @return [Array] list of [Event] with stop_on minor than Time.zone.today, ordered by start_on desc
class Happening < ApplicationRecord
  has_rich_text :body
  belongs_to :event, counter_cache: true
  has_many   :tickets, dependent: :destroy
  has_many   :users, through: :tickets
  has_many   :questions, dependent: :destroy
  has_one_attached :image do |attachable|
    attachable.variant :card, resize_to_limit: [ 417, 278 ]
    attachable.variant :aside, resize_to_limit: [ 318, 318 ]
    attachable.variant :ticket, resize_to_limit: [ 150, 68 ]
  end

  accepts_nested_attributes_for :questions, reject_if: :all_blank

  validates  :event, presence: true
  validates  :start_at, presence: true
  validates  :start_sale_at, presence: true
  validates  :stop_sale_at, presence: true
  validates  :max_tickets, presence: true
  validates  :max_tickets_for_user, presence: true
  after_save :update_event_data

  delegate :group_id, to: :event

  default_scope { includes(:event).order("start_at asc") }
  scope :searchable, ->(from: nil, to: nil, event_id: nil, group_id: nil, text: nil, soldout: nil) do
    by_keys = { start_at: (from.try(:to_date) || Date.today)..to.try(:to_date).try(:end_of_day) }
    by_keys[:event_id] = event_id if event_id.present?
    by_keys[:events] = { group_id: group_id } if group_id.present?
    by_text = text.present? ? [ "happenings.title ilike :text or events.title ilike :text", { text: "%#{text}%" } ] : nil
    @soldout = [ "happenings.tickets_count < happenings.max_tickets" ] if soldout == "1"
    @soldout = [ "happenings.tickets_count >= happenings.max_tickets" ] if soldout == "2"
    where(by_keys).where(by_text).where(@soldout)
  end


  # @return [Boolean] check seaelability time
  def saleable?
    active? && tickets_available?
  end

  # @return [Boolean] check if the happening is bookable
  def active?
    Time.zone.now >= start_sale_at && Time.zone.now <= stop_sale_at
  end

  # @return [Boolean] Check if there are tickets available
  def tickets_available?
    max_tickets > tickets_count
  end

  def tickets_available
    max_tickets - tickets_count
  end

  # @return [String] unique code to identify the {Happening}
  def code
    [ event_id, id ].join(" - ")
  end

  def self.massive_create(from:, to:, start_sale_before:, stop_sale_before:, template_id: nil, repeat_in: [], minutes: [], **opts)
    ary = []
    (from.to_date..to.to_date).map do |day|
      next unless repeat_in.include?(day.wday.to_s)
      minutes.reject(&:blank?).map do |minute|
        start_at          = day + minute.to_i.minutes
        start_sale_at     = day - start_sale_before.to_i.days
        stop_sale_at      = day.end_of_day - stop_sale_before.to_i.days
        questions_attributes = Template.find_by(id: template_id).try(:data) || []
        ary << opts.merge(start_at:, start_sale_at:, stop_sale_at:, questions_attributes:)
      end
    end
    create ary
  end

  def update_event_data
    event.stop_on  = start_at if event.stop_on.blank? || start_at.to_date > event.stop_on
    event.start_on = start_at if event.start_on.blank? || start_at.to_date < event.start_on
    event.happenings_count = event.happenings.count
    event.save if event.changed?
  end

  def image_url(_variant = :card)
    image.present? ? image.variant(:card) : event.image_url
  end
end
