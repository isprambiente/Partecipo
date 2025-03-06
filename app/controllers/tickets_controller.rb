# frozen_string_literal: true

# this controller manage {Ticket} model
class TicketsController < ApplicationController
  before_action :authenticate_user!, except: %i[new]
  before_action :set_ticket, only: %i[destroy]
  # GET /tickets
  def index
    @scope = filter_params[:scope]
    search = { user: current_user }
    search[:happening] = { start_at: ((filter_params[:from].try(:to_date) || Date.today)..filter_params[:to].try(:to_date).try(:end_of_day)) }
    search[:happening_id] = @scope if @scope.present?
    @text = [ "events.title ilike :text or happening.title ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
    @pagy, @tickets = pagy Ticket.includes(happening: [ :event ], answers: [ :question ]).where(search).where(@text), items: 10
  end

  def new
    @happening = Happening.find ticket_params[:happening_id]
    @answers = @happening.questions.map { |e| { question_id: e.id } }
    @ticket = Ticket.new happening: @happening, user: current_user, answers_attributes: @answers
  end

  # POST /event/:event_id/happenings/:happening_id/tickets
  def create
    @ticket = current_user.tickets.create(ticket_params)
    @happening = @ticket.happening
    @event = @happening.event
  end

  # POST /event/:event_id/happenings/:happening_id/tickets/:id
  def destroy
    @ticket.destroy
    respond_to do |format|
      format.html { redirect_to tickets_path, notice: "Ticket was successfully destroyed." }
      format.turbo_stream
    end
  end

  private

  # seet @ticket when needed
  def set_prerequisite
    @event = Event.find(params[:event_id])
    @happening = @event.happenings.find(params[:happening_id])
  end

  def set_ticket
    @ticket = Ticket.includes(happening: :event).find_by(user: current_user, id: params[:id])
  end

  # filter params for search {Happening}
  def filter_params
    params.fetch(:filter, {}).permit(:from, :scope, :text, :to)
  end

  # filter params for {Happening}'s {Ticket}
  def ticket_params
    params.fetch(:ticket, {}).permit(:happening_id, answers_attributes: [ :question_id, :value, :file ])
  end
end
