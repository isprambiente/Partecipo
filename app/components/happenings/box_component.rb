# frozen_string_literal: true

class Happenings::BoxComponent < CommonComponent
  def initialize(happening:)
    @happening = happening
  end

  def info
    ary = [
      [ t(".start_at"), l(@happening.start_at, format: :short), 'start-at' ],
      [ t(".max_tickets"), @happening.max_tickets, 'max-tickets' ],
      [ t(".max_tickets_for_user"), @happening.max_tickets_for_user, 'max-tickets-for-user' ],
      [ t(".available_tickets"), tag.span(@happening.tickets_available, id: "available_#{@happening.id}"), 'available-tickets' ]
    ]
    level ary
  end
end
