# frozen_string_literal: true

module Editor
  # This controller manafe {Happening} model for editors
  class HappeningsController < Editor::ApplicationController
    before_action :set_groups
    before_action :set_happening, only: %i[show edit update destroy]

    # GET /editor/events/:event_id/happenings
    def index
      request.format = filter_params[:format].to_sym if filter_params[:format].present?
      @categories = Group.pluck :title, :id
      @scope   = filter_params[:scope]
      from     = filter_params[:from]
      to       = filter_params[:to]
      event_id = filter_params[:scope]
      group_id = @groups.exists?(filter_params[:category]) ? filter_params[:category] : @groups.pluck(:id)
      text     = filter_params[:text]
      soldout  = filter_params[:soldout]
      searchable = Happening.searchable(from:, to:, event_id:, group_id:, text:, soldout:, reserved: true)
      respond_to do |format|
        format.html { @pagy, @happenings = pagy(searchable, items: 6) }
        format.csv { @happenings = searchable.includes(:questions, tickets: [ :answers, :user ]) }
        format.pdf { @happenings = searchable.includes(:questions, tickets: [ :answers, :user ]) }
      end
    end

    # GET /editor/events/:event_id/happenings/:id
    def show
      respond_to do |format|
        format.html { }
        format.csv { }
        format.pdf { }
      end
    end

    # GET /editor/events/event_id/happenings/new
    def new
      @event = Event.find_by(id: params[:event_id], group: @groups)
      @happening = @event.happenings.new
      @templates = Template.pluck :title, :id
    end

    # GET /editor/events/:event_id/happenings/:id/edit
    def edit
      @happening.questions.new
    end

    # POST /editor/happenings
    def create
      @event = Event.find_by(id: massive_create_params[:event_id], group: @groups)
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
      redirect_to editor_event_path(@happening.event)
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
      params.require(:happening).permit(:title, :image, :event_id, :max_tickets, :max_tickets_for_user, :start_at, :start_sale_at, :stop_sale_at, questions_attributes: [ :id, :title, :category, :mandatory, :weight, :_destroy ])
    end

    def massive_create_params
      params.require(:happening).permit(:title, :image, :event_id, :max_tickets, :max_tickets_for_user, :from, :to, :start_sale_before, :stop_sale_before, :template_id, repeat_in: [], minutes: [])
    end


    # Filter params for search an {Happening}
    def filter_params
      params.fetch(:filter, {}).permit(:from, :category, :scope, :text, :to, :soldout, :format)
    end
  end
end
