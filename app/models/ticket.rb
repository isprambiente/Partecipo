# frozen_string_literal: true

# This model manage the {Happening} {Ticket} for each {User}
# === Relations
# belongs to {Happening}
# belongs to {User}
# === Validates
# * presence of {Happening}
# * presence of {User}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {Ticket}
# @!attribute [rw] happening_id
#   @return [Integer] identifier of related {Happening}
# @!attribute [rw] user_id
#   @return [Integer] identifier of related {User}
# @!attribute [rw] by_editor
#   @return [Any] attr_accessor, valorized if action is executed by an editor
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was created
class Ticket < ApplicationRecord
  belongs_to :happening, counter_cache: true
  belongs_to :user
  has_many :answers, dependent: :destroy
  delegate :event, :event_id, :max_tickets, :max_tickets_for_user, :saleable?, :start_at, to: :happening, allow_nil: true
  accepts_nested_attributes_for :answers, reject_if: :all_blank
  attr_accessor :by_editor
  after_create  -> { TicketMailer.confirm(self).deliver_later }
  after_destroy -> { TicketMailer.deleted(self).deliver_later }

  validates :happening, presence: true
  validates :user, presence: true
  with_options unless: :by_editor do
    validates :saleable?, inclusion: [ true ]
    validates :tickets_count, numericality: { only_integer: true, less_than_or_equal_to: :max_tickets }
    validates :tickets_for_user_count,
              numericality: { only_integer: true, less_than_or_equal_to: :max_tickets_for_user }
    validates :missing_answers, absence: true
    validate  :validate_frequency
  end

  scope :with_user, ->(user) { where user: }

  # check if exists {Event}'s {Ticket} for {User} in a time period
  # @return [Boolean] true if exist a ticket in the time range
  def event_ticket_exist?(period = nil)
    @when = { happenings: { start_at: period } } if period.present?
    event.tickets.where(@when).where(user:).exists?
  end

  # count total of each other happening ticket self included
  # @return [Integer] number of tickets
  def tickets_count
    total = happening.tickets_count
    total += 1 unless persisted?
    total
  end

  # count total of each other happening ticket from {user} self included
  # @return [Integer] number of tickets
  def tickets_for_user_count
    total = happening.tickets.where(user:).count
    total += 1 unless persisted?
    total
  end

  private

  # check {User}'s ticket presence based of {Event#tickets_frequency}
  def validate_frequency
    exist, message = case event.tickets_frequency
    when "single"
                       [ event_ticket_exist?, I18n.t("site.ticket.errors.single") ]
    when "daily"
                       [ event_ticket_exist?(start_at.beginning_of_day..start_at.end_of_day),
                        I18n.t("site.ticket.errors.daily") ]
    when "weekly"
                       [ event_ticket_exist?(start_at.-(7.days)..start_at.+(7.days)),
                        I18n.t("site.ticket.errors.weekly") ]
    when "monthly"
                       [ event_ticket_exist?(start_at.-(30.days)..start_at.+(30.days)),
                        I18n.t("site.ticket.errors.montly") ]
    else
                       return true
    end
    errors.add(:seats, message) if exist
  end

  # check if all mandatory {Question} are present
  def missing_answers
    happening.questions  .mandatory.pluck(:id) - answers.map { |a| a.question_id }
  end
end
