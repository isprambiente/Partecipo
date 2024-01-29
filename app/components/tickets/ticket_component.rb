# frozen_string_literal: true

module Tickets
  # This class render a component wit a ticket information
  class TicketComponent < CommonComponent
    def initialize(ticket:, editor: false)
      @ticket = ticket
      @editor = editor
    end

    def destroy_url
      if @editor
        editor_ticket_path(@ticket)
      else
        ticket_path(@ticket)
      end
    end
  end
end
