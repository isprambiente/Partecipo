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
#   @return [String] unique login name for {User}
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
# @!attribute [rw] admin
#   @return [Boolean] [true] if {User} is an admin
# @!attribute [rw] editor
#   @return [Boolean] [true] if  {User} is an editor
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
class User < ApplicationRecord
  devise :cas_authenticatable, :timeoutable, :trackable
  has_many :tickets
  has_and_belongs_to_many :groups
  has_many :facts, through: :groups

  validates :username, presence: true, uniqueness: true
end
