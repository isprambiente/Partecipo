# frozen_string_literal: true

class Editor::FactsController < Editor::ApplicationController
  before_action :set_fact, only: %i[show edit update destroy]
  before_action :set_groups, only: %i[new edit create update]

  # GET /editor/facts
  def index; end

  def list
    type = filter_params[:type] == 'history' ? 'history' : 'future'
    @text = ['title ilike :text', text: "%#{filter_params[:text]}%"] if filter_params[:text].present?
    @pagy, @facts = pagy(current_user.facts.send(type).where(@text))
  end

  # GET /editor/facts/1
  def show; end

  # GET /editor/facts/new
  def new
    @fact = Fact.new
  end

  # GET /editor/facts/1/edit
  def edit; end

  # POST /editor/facts
  def create
    @fact = Fact.new(fact_params)
    if @fact.save
      @status = { success: 'Evento creato' }
      render action: :show
    else
      @status = { error: 'ERRORE - Evento non creato. Verifica gli errori.' }
      render action: :new
    end
  end

  # PATCH/PUT /editor/facts/1
  def update
    if @fact.update(fact_params)
      @status = { success: 'Evento Aggiornato' }
      render action: :show
    else
      @status = { error: 'ERRORE - Evento non aggiornato. Verifica gli errori.' }
      render :edit
    end
  end

  # DELETE /editor/facts/1
  def destroy
    if @editor_fact.destroy
      @status = { success: 'Evento eliminato' }
      render action: :index
    else
      @status = { error: 'ERRORE - Evento non eliminato. Verifica gli errori.' }
      render action: :edit
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_fact
    @fact = current_user.facts.find(params[:id])
  end

  def set_groups
    @groups = Group.pluck :title, :id
  end

  def filter_params
    params.fetch(:filter, {}).permit(:text, :type)
  end

  # Only allow a list of trusted parameters through.
  def fact_params
    params.require(:fact).permit(:title, :group_id, :body, :start_on, :stop_on, :pinned, :image, :where)
  end
end
