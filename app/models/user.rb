# frozen_string_literal: true

# This model manage the users
# === Relations
# has many {Happening}
# === Validates
# * presence of {username}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {User}
# @!attribute [rw] username
#   @return [String] unique username for user
# @!attribute [rw] email
#   @return [String] unique contact and login name for {User}
# @!attribute [rw] sign_in_count
#   @return [Integer] sign in count for {User}, default is 0, null is false
# @!attribute [rw] current_sign_in_at
#   @return [DateTime] Time of current sign in
# @!attribute [rw] last_sign_in_at
#   @return [DateTime] Time of last sign in
# @!attribute [rw] current_sign_in_ip
#   @return [Inet] ip of current sign in
# @!attribute [rw] last_sign_in_ip
#   @return [Inet] ip of last sign in
# @!attribute [rw] confirmation_token
#   @return [String] confirmation token to check email
# @!attribute [rw] confirmed_at
#   @return [DateTime] when email is confirmed
# @!attribute [rw] confirmation_sent_at
#   @return [DateTime] when the confirmation email was sent
# @!attribute [rw] unconfirmed_email
#   @return [String] address to check before an email chand
# @!attribute [rw] faileds_attempts
#   @return [Integer] number of failed login recived
# @!attribute [rw] unlock_tocken
#   @return [String] tocken to unlock an {User}
# @!attribute [rw] locked_at
#   @return [DateTime] when {User} was locked
# @!attribute [rw] admin
#   @return [Boolean] [true] if {User} is an admin
# @!attribute [rw] editor
#   @return [Boolean] [true] if  {User} is an editor
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :omniauthable
  devise *RAILS_DEVISE_MODULES
  has_many :tickets, dependent: :destroy
  has_and_belongs_to_many :groups
  has_many :events, through: :groups
  scope :editors, -> { where editor: true }
  scope :admins, -> { where admin: true }
  before_validation :add_username, on: :create
  validates :username, presence: true, uniqueness: true
  unless RAILS_DEVISE_DATABASE_AUTHENTICATABLE
    attr_accessor :password
  end

  # @return user finded or created from omiauth session
  def self.from_omniauth(auth)
    user = find_or_initialize_by(username: auth.uid)
    user.email = auth.info.email
    user.password = SecureRandom.alphanumeric(20)
    user.name = auth.info.try(ENV.fetch("RAILS_OIDC_NAME") { "given_name" })
    user.surname = auth.info.try(ENV.fetch("RAILS_OIDC_SURNAME") { "family_name" })
    user.skip_confirmation! if RAILS_DEVISE_CONFIRMABLE
    user.save
    user
  end

  # Make gravatar url from email
  # @return [String] gravatar user url
  def avatar_url
    hash = Digest::MD5.hexdigest(email)
    "https://www.gravatar.com/avatar/#{hash}?s=64i&d=identicon"
  end

  # @return [String] name and/or surname if presents, otherwise return username or email
  # @example User without name, surname, and username
  #   user = User.new email: 'test@test.it'
  #   user.title -> 'test@test.it'
  # @example user with username
  #   user = User.new email: 'test@isprambiente.it', username: 'test'
  #   user.title -> 'test'
  # @example user with all data
  #   user = User.new name: 'Mario', surname: 'Rossi', username....
  #   user.title: 'Mario Rossi'
  def title
    name.present? || surname.present? ? [ name, surname ].join(" ") : username || email
  end

  private

  # if username is empty, set username value as email
  # @return [String] username value
  def add_username
    self.username = email unless username?
    username
  end
end
