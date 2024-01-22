# frozen_string_literal: true

module Editor
  # This controller manafe {Happening} model for editors
  class HappeningsController < Editor::ApplicationController
    before_action :set_happening, only: %i[show edit update destroy export]

    # GET /editor/events/:event_id/happenings
    def index
      @categories = current_user.groups #.pluck :title, :id
      @category = @categories.pluck(:id).include?(filter_params[:category].to_i) ? filter_params[:category] : @categories.pluck(:id)
      @scope = filter_params[:scope]

      @pagy, @happenings = pagy(
        Happening
          .between(filter_params[:from], filter_params[:to])
          .by_text(filter_params[:text])
          .by_event(@scope)
          .by_group(@category), items: 6)
    end

    # GET /editor/events/:event_id/happenings/:id
    def show; end

    # GET /editor/events/event_id/happenings/new
    def new
      @event = current_user.events.find(params[:event_id])
      @happening = @event.happenings.new
    end

    # GET /editor/events/:event_id/happenings/:id/edit
    def edit; end

    # POST /editor/happenings
    def create
      @happening = @event.happenings.new(happening_params)

      if @happening.save
        render "editor/events/show"
      else
        render :new
      end
    end

    # PATCH/PUT /editor/events/:event_id/happenings/:id
    def update
      if @happening.update(happening_params)
        render action: :show
      else
        render :edit
      end
    end

    # DELETE /editor/events/:event_id/happenings/:id
    def destroy
      @happening.destroy
      redirect_to editor_root_path
    end

    # GET /editor/events/:event_id/happenings/:happening_id/tickets/export
    def export
      @tickets = [ %w[Email Posti] ] + @happening.tickets.includes(:user).all.map { |t|
                                          [ t.user.email, t.seats ]
                                        } + [ [ "Totale", @happening.seats_count ] ]
      send_data @tickets.map(&:to_csv).join, filename: "tickets.csv"
    end

    private

    # Set @happening when needed
    def set_happening
      @happening = Happening.includes(:event).where(event: {group: current_user.groups}).find(params[:id])
      @event = @happening.event
    end

    # Filter params for set an {Happening}
    def happening_params
      params.require(:happening).permit(:max_tickets, :max_tickets_for_user, :repeat_for, :start_at, :start_sale_at, :stop_sale_at, repeat_in: [])
    end

    # Filter params for search an {Happening}
    def filter_params
      params.fetch(:filter, {}).permit(:from, :category, :scope, :text, :to)
    end
  end
end
