# frozen_string_literal: true

class Happenings::BoxComponent < CommonComponent
  def initialize(happening:)
    @happening = happening
  end
  
  def info
    ary = [
    [ t(".start_at"), l(@happening.start_at, format: :short) ],
      [ t(".max_tickets"), @happening.max_tickets ],
      [ t(".max_tickets_for_user"), @happening.max_tickets_for_user ],
      [ t(".available_tickets"), tag.span(@happening.tickets_available, id: "available_#{@happening.id}") ]
    ]
    level ary
  end

end
