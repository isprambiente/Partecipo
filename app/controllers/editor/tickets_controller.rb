# frozen_string_literal: true

class Editor::TicketsController < Editor::ApplicationController
  require 'csv'
  before_action :set_fact
  before_action :set_happening
  before_action :set_ticket, only: %i[show edit update destroy]

  # GET /editor/tickets
  # GET /editor/tickets.json
  def index
    @text = ["users.username ilike '%:string%'", string: params[:text]] if params[:text].present?
    @pagy, @tickets = pagy(
      @happening.tickets.joins(:user).where(@text),
      link_extra: "data-remote='true' data-action='ajax:success->section#goPage'",
      items: 6
    )
  end

  def export
    @tickets = [%w[Username Posti]]
    @tickets += @happening.tickets.includes(:user).all.map { |t| [t.user.username, t.seats] }
    @tickets += [['Totale', @happening.seats_count]]

    respond_to do |format|
      format.html { redirect_to editor_fact_happening_path(@fact, @happening) }
      format.pdf  { redirect_to editor_fact_happening_path(@fact, @happening) }
      format.csv  { send_data @tickets.map(&:to_csv).join, filename: 'tickets.csv' }
    end
  end

  # GET /editor/tickets/new
  def new
    @ticket = @happening.tickets.new
    @users = User.pluck :username, :id
    render :form
  end

  # GET /editor/tickets/1/edit
  def edit
    @users = User.pluck :username, :id
    render :form
  end

  # POST /editor/tickets
  # POST /editor/tickets.json
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

  # PATCH/PUT /editor/tickets/1
  # PATCH/PUT /editor/tickets/1.json
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

  # DELETE /editor/tickets/1
  # DELETE /editor/tickets/1.json
  def destroy
    @ticket.destroy
    flash[:success] = 'Prenotazione eliminata'
    redirect_to editor_fact_happening_path(@fact, @happening)
  end

  private

  def set_fact
    @fact = current_user.facts.find(params[:fact_id])
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_happening
    @happening = @fact.happenings.find(params[:happening_id])
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_ticket
    @ticket = @happening.tickets.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def ticket_params
    params.require(:ticket).permit(:happenings_id, :user_id, :seats)
  end
end
