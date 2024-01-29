# frozen_string_literal: true

module Admin
  # This controller manage {Group} model for admin {User}
  class GroupsController < Admin::ApplicationController
    before_action :set_group, only: %i[edit update destroy]
    before_action :set_users, only: %i[new create edit update]

    # GET /admin/groups
    def index
      @text = [ "title ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
      @pagy, @groups = pagy(Group.all.where(@text))
    end

    # GET /admin/groups/new
    def new
      @group = Group.new
      render action: "edit"
    end

    # GET /admin/groups/1/edit
    def edit
      @users = User.editors.pluck :email, :id
    end

    # POST /admin/groups
    def create
      @group = Group.new(group_params)
      set_users

      if @group.save
        @status = { success: "Gruppo creato" }
        redirect_to admin_groups_path
      else
        @status = { error: "Creazione gruppo fallita" }
        render action: "edit"
      end
    end

    # PATCH/PUT /admin/groups/1
    def update
      @users = @group.users.pluck :email, :id
      if @group.update(group_params)
        @status = { success: "Gruppo aggiornato" }
        redirect_to admin_groups_path
      else
        @status = { error: "Aggiornamento gruppo fallito" }
        render :edit
      end
    end

    # DELETE /admin/groups/1
    def destroy
      @group.destroy
      redirect_to admin_groups_path, notice: "Group was successfully destroyed."
    end

    private

    # Set {Group} when needed
    def set_group
      @group = Group.find(params[:id])
    end

    # preset users value
    def set_users
    @users = User.editors.pluck :email, :id
    end

    # filter params for search groups
    def filter_params
      params.fetch(:filter, {}).permit(:text)
    end

    # Filter params for create/change a {Ticket} istance
    def group_params
      params.require(:group).permit(:title, user_ids: [])
    end
  end
end
