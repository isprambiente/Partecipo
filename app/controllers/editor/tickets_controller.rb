# frozen_string_literal: true

# This controller manage {Ticket} model for editors
class Editor::TicketsController < Editor::ApplicationController
  require 'csv'
  before_action :check_happening, only: %i[create update]
  # before_action :set_fact_ids
  # before_action :set_happening
  before_action :set_ticket, only: %i[show edit update destroy]

  # GET /editor/tickets
  def index; end

  # GET /editor/tickets/list
  def list_by_happening
    @happening = Happening.find_by(id: params[:id], fact_id: fact_ids)
    @text = ['users.username ilike :string', { string: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @tickets = pagy(
      @happening.tickets.includes(:user).where(@text),
      items: 6
    )
    render action: :list
  end

  def list_by_user
    @user = User.find(params[:id])
    @text = ['facts.title ilike :string', { string: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @tickets = pagy(
      @user.tickets.includes(happening: [:fact]).where(@text).where(happening: { fact_id: fact_ids }),
      items: 6
    )
    render action: :list
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
      broadcast_action_to "editor:happening_#{@ticket.happening_id}", action: :prepend, target: 'editor_tickets', locals: { ticket: self}, partial: 'editor/tickets/ticket'
      render turbo_stream: [
        turbo_stream.replace("editor_ticket_#{@ticket.id}", partial: 'ticket', locals: {ticlet: @ticket}),
        turbo_stream.replace('modal', partial: 'modal_empty')
      ]

      render 'empty_modal'
    else
      @status = { error: 'Creatione prenotazione fallita' }
      render action: 'new'
    end
  end

  # PATCH/PUT /editor/facts/:fact_id/happenings/:happening_id/tickets/:id
  def update
    if @ticket.update(ticket_params.merge(by_editor: true))
      render partial: 'modal_empty'
    else
      render partial: 'form', locals: { ticket: @ticket, happening: @happening, fact: @fact }
    end
  end

  # DELETE /editor/facts/:fact_id/happenings/:happening_id/tickets/:id
  def destroy
    @ticket.destroy
    render partial: 'modal_empty'
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
