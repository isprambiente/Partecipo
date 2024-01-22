# frozen_string_literal: true

module Editor
  # This controller manage {Event} model for editors
  class EventsController < Editor::ApplicationController
    before_action :set_event, only: %i[show edit update destroy]
    before_action :set_groups, only: %i[new create edit update]

    # GET /editor/events
    def index
      @categories = current_user.groups.pluck :title, :id
      @text = [ "title ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
      search = { stop_on: ((filter_params[:from].try(:to_date) || Date.today)..) }
      search[:start_on] = (..filter_params[:to].try(:to_date)) if filter_params[:to].present?
      search[:group] = filter_params[:category] if filter_params[:category].present?
      search[:group_id] = current_user.groups.pluck :id
      @pagy, @events = pagy(Event.where(@text).where(search).or(Event.where stop_on: nil), items: 6)
    end

    # GET /editor/events/:id
    def show; end

    # GET /editor/events/new
    def new
      @event = Event.new
    end

    # GET /editor/events/:id/edit
    def edit; end

    # POST /editor/events
    def create
      @event = Event.new(event_params)
      if @event.save
        @status = { success: "Evento creato" }
        redirect_to editor_event_path(@event)
      else
        @status = { error: "ERRORE - Evento non creato. Verifica gli errori." }
        render action: :new
      end
    end

    # PATCH/PUT /editor/events/:id
    def update
      if @event.update(event_params)
        @status = { success: "Evento Aggiornato" }
        render action: :show
      else
        @status = { error: "ERRORE - Evento non aggiornato. Verifica gli errori." }
        render :edit
      end
    end

    # DELETE /editor/events/:id
    def destroy
      if @event.destroy
        @status = { success: "Evento eliminato" }
        redirect_to editor_events_path
      else
        @status = { error: "ERRORE - Evento non eliminato. Verifica gli errori." }
        render action: :edit
      end
    end

    private

    # set @event for current user when needed
    def set_event
      @event = current_user.events.find(params[:id])
      @scope = @event.id
    end

    def set_groups
      @groups = current_user.groups
    end

    # Filter params for search a {Event}
    def filter_params
      params.fetch(:filter, {}).permit(:category, :from, :text, :to)
    end

    # Filter params for set a {Event}
    def event_params
      params.require(:event).permit(:tickets_frequency, :title, :group_id, :body, :start_on, :stop_on, :pinned, :image,
                                   :where)
    end
  end
end
