# frozen_string_literal: true

class TicketsController < ApplicationController
  before_action :set_ticket, only: %i[create destroy]

  # GET /tickets
  def index; end

  # GET /tickets/list
  def list
    type = filter_tickets[:type] == 'history' ? 'start_at < :from' : 'start_at > :from'
    @text = ['facts.title ilike :text', text: "%#{filter_tickets[:text]}%"] if filter_tickets[:text].present?
    @pagy, @tickets = pagy(
      current_user.tickets.joins(happening: [:fact]).where(type, from: Time.zone.now).where(@text),
      link_extra: "data-remote='true' data-action='ajax:success->section#goPage'",
      items: 15
    )
  end

  # POST /fact/:fact_id/happenings/:happening_id/tickets
  def create
    @status = if @ticket.update filter_ticket
                { success: 'Prenotazione eseguita' }
              else
                { error: 'Prenotazione fallita' }
              end
    render 'happenings/show'
  end

  # POST /fact/:fact_id/happenings/:happening_id/tickets/:id
  def destroy
    @status = if @ticket.destroy
                { success: 'Prenotazione annullata' }
              else
                { error: 'Prenotazione non annullabile' }
              end
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
