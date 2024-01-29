# frozen_string_literal: true

module Editor
  # This controller manafe {Happening} model for editors
  class HappeningsController < Editor::ApplicationController
    before_action :set_groups
    before_action :set_happening, only: %i[show edit update destroy export]

    # GET /editor/events/:event_id/happenings
    def index
      @categories = Group.pluck :title, :id
      @scope   = filter_params[:scope]
      from     = filter_params[:from]
      to       = filter_params[:to]
      event_id = filter_params[:scope]
      group_id = @groups.exists?(filter_params[:category]) ? filter_params[:category] : @groups.pluck(:id)
      text     = filter_params[:text]
      @pagy, @happenings = pagy(Happening.searchable(from:, to:, event_id:, group_id:, text:), items: 6)
    end

    # GET /editor/events/:event_id/happenings/:id
    def show; end

    # GET /editor/events/event_id/happenings/new
    def new
      @event = Event.find_by(id: params[:event_id], group: @groups)
      @happening = @event.happenings.new
    end

    # GET /editor/events/:event_id/happenings/:id/edit
    def edit; end

    # POST /editor/happenings
    def create
      @event = Event.find_by(id: happening_params[:event_id], group: @groups)
      @happenings = @event.happenings.massive_create(**massive_create_params.to_h.to_options)
      @happening = @happenings.first

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
      @tickets = [ %w[Email] ] + @happening.tickets.includes(:user).all.map { |t|
                                          [ t.user.email ]
                                        } + [ [ @happening.tickets_count ] ]
      send_data @tickets.map(&:to_csv).join, filename: "tickets.csv"
    end

    private

    def set_groups
      @groups = current_user.groups
    end

    # Set @happening when needed
    def set_happening
      @happening = Happening.includes(:event).where(event: { group: current_user.groups }).find(params[:id])
      @event = @happening.event
    end

    # Filter params for set an {Happening}
    def happening_params
      params.require(:happening).permit(:title, :event_id, :max_tickets, :max_tickets_for_user, :start_at, :start_sale_at, :stop_sale_at)
    end

    def massive_create_params
      params.require(:happening).permit(:title, :event_id, :max_tickets, :max_tickets_for_user, :from, :to, :start_sale_before, :stop_sale_before, repeat_in: [], minutes: [])
    end


    # Filter params for search an {Happening}
    def filter_params
      params.fetch(:filter, {}).permit(:from, :category, :scope, :text, :to)
    end
  end
end
