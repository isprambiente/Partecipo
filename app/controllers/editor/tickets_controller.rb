# frozen_string_literal: true

# This controller manage {Ticket} model for editors
class Editor::TicketsController < Editor::ApplicationController
  require 'csv'
  before_action :set_fact
  before_action :set_happening
  before_action :set_ticket, only: %i[show edit update destroy]

  # GET /editor/facts/:fact_id/happenings/:happening_id/tickets
  # GET /editor/tickets.json
  def index
    @text = ["users.username ilike '%:string%'", string: params[:text]] if params[:text].present?
    @pagy, @tickets = pagy(
      @happening.tickets.joins(:user).where(@text),
      link_extra: "data-remote='true' data-action='ajax:success->section#goPage'",
      items: 6
    )
  end

  # GET /editor/facts/:fact_id/happenings/:happening_id/tickets/export
  def export
    @tickets = [
      %w[Username Posti],
      @happening.tickets.includes(:user).all.map { |t| [t.user.username, t.seats] },
      ['Totale', @happening.seats_count]
    ]
    send_data @tickets.map(&:to_csv).join, filename: 'tickets.csv'
  end

  # GET /editor/facts/:fact_id/happenings/:happening_id/tickets/new
  def new
    @ticket = @happening.tickets.new
    @users = User.pluck :username, :id
    render :form
  end

  # GET /editor/facts/:fact_id/happenings/:happening_id/tickets/:id/edit
  def edit
    @users = User.pluck :username, :id
    render :form
  end

  # POST /editor/facts/:fact_id/happenings/:happening_id/tickets/
  def create
    @ticket = @happening.tickets.new(ticket_params)
    @ticket.by_editor = true
    if @ticket.save
      flash[:success] = 'Prenotazione salvata'
      redirect_to editor_fact_happening_path(@fact, @happening)
    else
      @users = User.pluck :username, :id
      @status = { error: 'Creatione prenotazione fallita' }
      render :form
    end
  end

  # PATCH/PUT /editor/facts/:fact_id/happenings/:happening_id/tickets/:id
  def update
    @ticket.by_editor = true
    if @ticket.update(ticket_params)
      flash[:success] = 'Prenotazione salvata'
      redirect_to editor_fact_happening_path(@fact, @happening)
    else
      @users = User.pluck :username, :id
      @status = { error: 'Aggionramento prenotazione fallito' }
      render :form
    end
  end

  # DELETE /editor/facts/:fact_id/happenings/:happening_id/tickets/:id
  def destroy
    @ticket.destroy
    flash[:success] = 'Prenotazione eliminata'
    redirect_to editor_fact_happening_path(@fact, @happening)
  end

  private

  # set @fact before any action
  def set_fact
    @fact = current_user.facts.find(params[:fact_id])
  end

  # Set @happening before any action
  def set_happening
    @happening = @fact.happenings.find(params[:happening_id])
  end

  # Set ticket when needed
  def set_ticket
    @ticket = @happening.tickets.find(params[:id])
  end

  # Filter params for set a ticket
  def ticket_params
    params.require(:ticket).permit(:happenings_id, :user_id, :seats)
  end
end
