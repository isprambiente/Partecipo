# frozen_string_literal: true

module Editor
  # This controller manage {Event} model for editors
  class EventsController < Editor::ApplicationController
    before_action :set_groups
    before_action :set_event, only: %i[show edit update destroy]

    # GET /editor/events
    def index
      @categories = @groups.pluck :title, :id
      from     = filter_params[:from]
      to       = filter_params[:to]
      group_id = @groups.exists?(filter_params[:category]) ? filter_params[:category] : @groups.pluck(:id)
      text     = filter_params[:text]
      @pagy, @events = pagy(Event.searchable(from:, to:, group_id:, text:, editor: true), items: 6)
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
      @event = Event.find_by(id: params[:id], group: @groups)
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
                                   :where, :single)
    end
  end
end
