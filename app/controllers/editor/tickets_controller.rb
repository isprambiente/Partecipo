# frozen_string_literal: true

module Editor
  # This controller manage {Ticket} model for editors
  class TicketsController < Editor::ApplicationController
    require "csv"
    before_action :check_happening, only: %i[create update]
    before_action :set_ticket, only: %i[edit update destroy]

    # GET /editor/tickets
    def index
      @scope = filter_params[:scope]
      search = {}
      search[:happening] = { start_at: ((filter_params[:from].try(:to_date) || Date.today)..filter_params[:to].try(:to_date).try(:end_of_day)) }
      search[:happening_id] = @scope if @scope.present?
      search[:user_id] = filter_params[:category] if filter_params[:category].present?
      @text = [ "events.title ilike :text or users.email ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
      @pagy, @tickets = pagy Ticket.includes(happening: [ :event]).where(search).where(@text), items: 10
    end

    # GET /editor/events/:event_id/happenings/:happening_id/tickets/new
    def new
      @ticket = Ticket.new(happening_id: happening_id(filter_params[:happening_id]))
      @users = User.pluck :email, :id
    end

    # GET /editor/events/:event_id/happenings/:happening_id/tickets/:id/edit
    def edit
      @users = User.pluck :email, :id
    end

    # POST /editor/events/:event_id/happenings/:happening_id/tickets/
    def create
      @ticket = Ticket.new(ticket_params)
      @ticket.by_editor = true
      if @ticket.save
        broadcast_action_to "editor:happening_#{@ticket.happening_id}", action: :prepend, target: "editor_tickets",
                                                                        locals: { ticket: self }, partial: "editor/tickets/ticket"
        render turbo_stream: [
          turbo_stream.replace("editor_ticket_#{@ticket.id}", partial: "ticket", locals: { ticlet: @ticket }),
          turbo_stream.replace("modal", partial: "modal_empty")
        ]

        render "empty_modal"
      else
        @status = { error: "Creatione prenotazione fallita" }
        render action: "new"
      end
    end

    # PATCH/PUT /editor/events/:event_id/happenings/:happening_id/tickets/:id
    def update
      if @ticket.update(ticket_params.merge(by_editor: true))
        render partial: "modal_empty"
      else
        render partial: "form", locals: { ticket: @ticket, happening: @happening, event: @event }
      end
    end

    # DELETE /editor/events/:event_id/happenings/:happening_id/tickets/:id
    def destroy
      @ticket.destroy
    end

    private

    def check_happening
      access_denied! unless event_ids.include?(Happening.find(ticket_params[:happening_id]).event_id)
    end

    # set @event before any action
    def event_ids
      current_user.events.pluck(:id)
    end

    # Set @happening before any action
    def happening_id(value)
      Happening.find_by(id: value, event_id: event_ids).id
    end

    # Set ticket when needed
    def set_ticket
      @ticket = Ticket.includes(:happening).find(params[:id])
      access_denied! unless event_ids.include?(@ticket.happening.event_id)
    end

    # Filter params for set a ticket
    def ticket_params
      params.require(:ticket).permit(:happening_id, :user_id, :seats)
    end

    # Filter params for search an {Ticket}
    def filter_params
      params.fetch(:filter, {}).permit(:category, :from, :scope, :text, :to)
    end
  end
end
