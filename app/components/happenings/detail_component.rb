# frozen_string_literal: true

module Happenings
  class DetailComponent < CommonComponent
    def initialize(happening:, user: nil, editor: false)
      super
      @happening = happening
      @user = user
      @editor = editor
    end

    def info
      ary = [
        [ t(".start_at"), l(@happening.start_at, format: :short)],
        [ t(".max_tickets"), @happening.max_tickets ],
        [ t(".max_tickets_for_user"), @happening.max_tickets_for_user],
        [ t(".available_tickets"), tag.span(@happening.tickets_available, id: "available_#{@happening.id}") ]
      ]
      level ary
    end

    def new_link
      @user.present? ? tickets_path(ticket: { happening_id: @happening.id }) : new_user_session_path
    end
  end
end
