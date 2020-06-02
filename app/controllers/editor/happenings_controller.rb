# frozen_string_literal: true

class Editor::HappeningsController < Editor::ApplicationController
  before_action :set_fact
  before_action :set_happening, only: %i[show edit update destroy]

  # GET /editor/happenings
  # GET /editor/happenings.json
  def index
    type = happenings_filter[:type] == 'history' ? 'history' : 'future'
    @text = ['detail ilike :text', text: "%#{happenings_filter[:text]}%"] if happenings_filter[:text].present?
    @pagy, @happenings = pagy(
      @fact.happenings.send(type).where(@text),
      link_extra: "data-remote='true' data-action='ajax:success->section#goPage'",
      items: 6
    )
  end

  # GET /editor/happenings/1
  # GET /editor/happenings/1.json
  def show
    set_tickets
  end

  # GET /editor/happenings/new
  def new
    @happening = @fact.happenings.new
  end

  # GET /editor/happenings/1/edit
  def edit; end

  # POST /editor/happenings
  # POST /editor/happenings.json
  def create
    @happening = @fact.happenings.new(happening_params)

    if @happening.save
      set_tickets
      render :show
    else
      render :new
    end
  end

  # PATCH/PUT /editor/happenings/1
  # PATCH/PUT /editor/happenings/1.json
  def update
    if @happening.update(happening_params)
      set_tickets
      render :show
    else
      render :edit
    end
  end

  # DELETE /editor/happenings/1
  # DELETE /editor/happenings/1.json
  def destroy
    @happening.destroy
    redirect_to editor_root_path
  end

  private

  def set_fact
    @fact = current_user.facts.find(params[:fact_id])
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_happening
    @happening = @fact.happenings.find(params[:id])
  end

  def set_tickets
    @pagy, @tickets = pagy(
      @happening.tickets,
      link_extra: "data-remote='true' data-action='ajax:success->section#goPage'",
      items: 6
    )
  end

  # Only allow a list of trusted parameters through.
  def happening_params
    params.require(:happening).permit(:detail, :start_at, :start_sale_at, :stop_sale_at, :max_seats, :max_seats_for_ticket)
  end

  def happenings_filter
    params.fetch(:filter, {}).permit(:text, :type)
  end
end
