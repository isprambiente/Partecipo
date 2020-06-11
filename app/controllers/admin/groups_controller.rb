# frozen_string_literal: true

class Admin::GroupsController < Admin::ApplicationController
  before_action :set_group, only: %i[show edit update destroy]
  before_action :set_users, only: %i[edit update]

  # GET /admin/groups
  # GET /admin/groups.json
  def index
  end

  def list
    @text = ['title ilike :text', text: "%#{filter_params[:text]}%"] if filter_params[:text].present?
    @pagy, @groups = pagy(Group.all.where(@text))
  end

  # GET /admin/groups/1
  # GET /admin/groups/1.json
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
  # POST /admin/groups.json
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
  # PATCH/PUT /admin/groups/1.json
  def update
    @users = @group.users.pluck :username, :id
    if @group.update(group_params)
      @status = { success: 'Gruppo aggiornato' } 
      render :show
    else
      @status = { error: 'Aggiornamento gruppo fallito'}
      render :edit 
    end
  end

  # DELETE /admin/groups/1
  # DELETE /admin/groups/1.json
  def destroy
    @group.destroy
    respond_to do |format|
      format.html { redirect_to groups_url, notice: 'Group was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_group
    @group = Group.find(params[:id])
  end

  # preset users value
  def set_users
    @users = @group.users
  end

  def filter_params
     params.fetch(:filter, {}).permit(:text)
  end

  # Only allow a list of trusted parameters through.
  def group_params
    params.require(:group).permit(:title, user_ids: [])
  end
end
