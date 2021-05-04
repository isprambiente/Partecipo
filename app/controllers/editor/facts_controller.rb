# frozen_string_literal: true

# This controller manage {Fact} model for editors
class Editor::FactsController < Editor::ApplicationController
  before_action :set_fact, only: %i[show edit update destroy]
  before_action :set_groups, only: %i[new edit create update]

  # GET /editor/facts
  def index; end

  # GET /editor/facts/list
  def list
    type = filter_params[:type] == 'history' ? 'history' : 'future'
    @text = ['facts.title ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @facts = pagy(current_user.facts.send(type).where(@text))
  end

  # GET /editor/facts/:id
  def show; end

  # GET /editor/facts/new
  def new
    @fact = Fact.new
  end

  # GET /editor/facts/:id/edit
  def edit; end

  # POST /editor/facts
  def create
    @fact = Fact.new(fact_params)
    if @fact.save
      @status = { success: 'Evento creato' }
      redirect_to editor_fact_path(@fact)
    else
      @status = { error: 'ERRORE - Evento non creato. Verifica gli errori.' }
      render action: :new
    end
  end

  # PATCH/PUT /editor/facts/:id
  def update
    if @fact.update(fact_params)
      @status = { success: 'Evento Aggiornato' }
      render action: :show
    else
      @status = { error: 'ERRORE - Evento non aggiornato. Verifica gli errori.' }
      render :edit
    end
  end

  # DELETE /editor/facts/:id
  def destroy
    if @fact.destroy
      @status = { success: 'Evento eliminato' }
      redirect_to editor_facts_path
    else
      @status = { error: 'ERRORE - Evento non eliminato. Verifica gli errori.' }
      render action: :edit
    end
  end

  private

  # set @fact for current user when needed
  def set_fact
    @fact = current_user.facts.find(params[:id])
  end

  # set a list of {Group}
  def set_groups
    @groups = Group.pluck :title, :id
  end

  # Filter params for search a {Fact}
  def filter_params
    params.fetch(:filter, {}).permit(:text, :type)
  end

  # Filter params for set a {Fact}
  def fact_params
    params.require(:fact).permit(:tickets_frequency, :title, :group_id, :body, :start_on, :stop_on, :pinned, :image, :where)
  end
end
