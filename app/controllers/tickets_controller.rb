# frozen_string_literal: true

# this controller manage {Ticket} model
class TicketsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_ticket, only: %i[create destroy]

  # GET /tickets
  def index; end

  # GET /tickets/list
  def list
    type = filter_tickets[:type] == 'history' ? 'start_at < :from' : 'start_at > :from'
    @text = ['facts.title ilike :text', { text: "%#{filter_tickets[:text]}%" }] if filter_tickets[:text].present?
    @pagy, @tickets = pagy current_user.tickets.joins(happening: [:fact]).where(type, from: Time.zone.now).where(@text), items: 10
  end

  # POST /fact/:fact_id/happenings/:happening_id/tickets
  def create
    TicketMailer.with(ticket: @ticket).confirm.deliver_later if @ticket.update filter_ticket
    render 'happenings/show'
  end

  # POST /fact/:fact_id/happenings/:happening_id/tickets/:id
  def destroy
    TicketMailer.with(ticket: @ticket).deleted.deliver_later if @ticket.destroy
    render 'happenings/show'
  end

  private

  # seet @ticket when needed
  def set_ticket
    @fact = Fact.find(params[:fact_id])
    @happening = @fact.happenings.find(params[:happening_id])
    @ticket = @happening.tickets.find_or_initialize_by(user: current_user)
  end

  # filter params for search {Happening}
  def filter_tickets
    params.fetch(:filter, {}).permit(:text, :type)
  end

  # filter params for {Happening}'s {Ticket}
  def filter_ticket
    params.fetch(:ticket, {}).permit(:seats)
  end
end
