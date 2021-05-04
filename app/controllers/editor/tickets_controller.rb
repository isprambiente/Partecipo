# frozen_string_literal: true

# This controller manage {Ticket} model for editors
class Editor::TicketsController < Editor::ApplicationController
  require 'csv'
  before_action :check_happening, only: %i[create update]
  #before_action :set_fact_ids
  #before_action :set_happening
  before_action :set_ticket, only: %i[show edit update destroy]

  # GET /editor/tickets
  def index
  end

  # GET /editor/tickets/list
  def list_by_happening
    @happening = Happening.find_by(id: params[:id], fact_id: fact_ids) 
    @text = ["users.username ilike :string", { string: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @tickets = pagy(
      @happening.tickets.includes(:user).where(@text),
      items: 6
    )
    render action: :list
  end
  
  def list_by_user
    @user = User.find(params[:id])
    @text = ["facts.title ilike :string", { string: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @tickets = pagy(
      @user.tickets.includes(happening: [:fact]).where(@text).where(happening: {fact_id: fact_ids}),
      items: 6
    )
    render action: :list
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
    @ticket = Ticket.new(happening_id: happening_id(filter_params[:happening_id]))
    @users = User.pluck :username, :id
  end

  # GET /editor/facts/:fact_id/happenings/:happening_id/tickets/:id/edit
  def edit
    @users = User.pluck :username, :id
  end

  # POST /editor/facts/:fact_id/happenings/:happening_id/tickets/
  def create
    @ticket = Ticket.new(ticket_params)
    @ticket.by_editor = true
    if @ticket.save
      flash[:success] = 'Prenotazione salvata'
      redirect_to tickets_editor_fact_happening_path(@ticket.happening.fact, @ticket.happening)
    else
      @users = User.pluck :username, :id
      @status = { error: 'Creatione prenotazione fallita' }
      render action: 'new'
    end
  end

  # PATCH/PUT /editor/facts/:fact_id/happenings/:happening_id/tickets/:id
  def update
    if @ticket.update(ticket_params.merge(by_editor: true))
      flash[:success] = 'Prenotazione salvata'
      render partial: 'ticket', locals: { ticket: @ticket, happening: @happening, fact: @fact }
    else
      @users = User.pluck :username, :id
      @status = { error: 'Aggionramento prenotazione fallito' }
      render partial: 'form', locals: { ticket: @ticket, happening: @happening, fact: @fact }
    end
  end

  # DELETE /editor/facts/:fact_id/happenings/:happening_id/tickets/:id
  def destroy
    @ticket.destroy
    flash[:success] = 'Prenotazione eliminata'
    redirect_to editor_fact_happening_path(@fact, @happening)
  end

  private
  
  def check_happening
    access_denied! unless fact_ids.include?(Happening.find(ticket_params[:happening_id]).fact_id)
  end

  # set @fact before any action
  def fact_ids
    current_user.facts.pluck(:id)
  end

  # Set @happening before any action
  def happening_id(value)
    Happening.find_by(id: value, fact_id: fact_ids).id
  end

  # Set ticket when needed
  def set_ticket
    @ticket = Ticket.includes(:happening).find(params[:id])
    access_denied! unless fact_ids.include?(@ticket.happening.fact_id)
  end

  # Filter params for set a ticket
  def ticket_params
    params.require(:ticket).permit(:happening_id, :user_id, :seats)
  end

  # Filter params for search an {Happening}
  def filter_params
    params.fetch(:filter, {}).permit(:text, :user_id, :happening_id)
  end
end
