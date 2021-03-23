# frozen_string_literal: true

# This controller manage {Group} model for admin {User}
class Admin::GroupsController < Admin::ApplicationController
  before_action :set_group, only: %i[show edit update destroy]
  before_action :set_users, only: %i[edit update]

  # GET /admin/groups
  def index; end

  # GET /admin/groups/list
  def list
    @text = ['title ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @groups = pagy(Group.all.where(@text))
  end

  # GET /admin/groups/1
  def show; end

  # GET /admin/groups/new
  def new
    @group = Group.new
    @users = []
  end

  # GET /admin/groups/1/edit
  def edit
    @users = @group.users.pluck :username, :id
  end

  # POST /admin/groups
  def create
    @group = Group.new(group_params)
    set_users

    if @group.save
      @status = { success: 'Gruppo creato' }
      render :show
    else
      @status = { error: 'Creazione gruppo fallita' }
      render :new
    end
  end

  # PATCH/PUT /admin/groups/1
  def update
    @users = @group.users.pluck :username, :id
    if @group.update(group_params)
      @status = { success: 'Gruppo aggiornato' }
      render :show
    else
      @status = { error: 'Aggiornamento gruppo fallito' }
      render :edit
    end
  end

  # DELETE /admin/groups/1
  def destroy
    @group.destroy
    respond_to do |format|
      format.html { redirect_to groups_url, notice: 'Group was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

  # Set {Group} when needed
  def set_group
    @group = Group.find(params[:id])
  end

  # preset users value
  def set_users
    @users = @group.users
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
